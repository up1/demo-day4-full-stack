using System.Data.Common;
using api.Data;
using api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string TestEmail = "user@example.com";
    public const string TestPassword = "password123";

    private bool _seeded;
    private readonly object _seedLock = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Use a non-Development environment so Program.cs's dev seed doesn't run.
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TEST_SUPER_SECRET_KEY_FOR_INTEGRATION_TESTS_ONLY_!!",
                ["Jwt:Issuer"] = "demo_day4.api.tests",
                ["Jwt:Audience"] = "demo_day4.web.tests",
                ["Jwt:ExpiryMinutes"] = "60"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remove the app's existing AppDbContext registration.
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (dbContextDescriptor is not null)
            {
                services.Remove(dbContextDescriptor);
            }

            var dbConnectionDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbConnection));
            if (dbConnectionDescriptor is not null)
            {
                services.Remove(dbConnectionDescriptor);
            }

            // Open SQLite in-memory connection per factory instance.
            services.AddSingleton<DbConnection>(_ =>
            {
                var connection = new SqliteConnection("DataSource=:memory:");
                connection.Open();
                return connection;
            });

            services.AddDbContext<AppDbContext>((sp, options) =>
            {
                var connection = sp.GetRequiredService<DbConnection>();
                options.UseSqlite(connection);
            });
        });
    }

    protected override void ConfigureClient(HttpClient client)
    {
        EnsureSeeded();
        base.ConfigureClient(client);
    }

    private void EnsureSeeded()
    {
        if (_seeded)
        {
            return;
        }

        lock (_seedLock)
        {
            if (_seeded)
            {
                return;
            }

            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();

            if (!db.Users.Any(u => u.Email == TestEmail))
            {
                db.Users.Add(new User
                {
                    Email = TestEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(TestPassword)
                });
                db.SaveChanges();
            }

            _seeded = true;
        }
    }
}
