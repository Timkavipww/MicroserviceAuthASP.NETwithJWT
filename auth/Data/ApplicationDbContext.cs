using auth.Models;
using Microsoft.EntityFrameworkCore;

namespace auth.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {

    }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);

        modelBuilder.Entity<User>().HasData(
            new[]{
                new User{HashPassword = "asdasd",  Username = "asdasdasd"},
                new User{HashPassword = "qweqweqwe", Username = "qweqweqwe"},

            }
        );

        base.OnModelCreating(modelBuilder);
    }

}
