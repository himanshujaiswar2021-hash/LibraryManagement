package com.library.config;

import com.library.book.domain.Author;
import com.library.book.domain.Book;
import com.library.book.domain.BookStatus;
import com.library.book.domain.Category;
import com.library.book.repository.AuthorRepository;
import com.library.book.repository.BookRepository;
import com.library.book.repository.CategoryRepository;
import com.library.member.domain.Member;
import com.library.member.domain.MemberStatus;
import com.library.member.repository.MemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

/**
 * Simple Data Initializer
 * Automatically seeds sample books on racks, authors, categories, and members
 * when running with an in-memory database or on first boot.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final MemberRepository memberRepository;

    public DataInitializer(
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            CategoryRepository categoryRepository,
            MemberRepository memberRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (bookRepository.count() > 0) {
            log.info("Database already contains books. Skipping initial seed.");
            return;
        }

        log.info("Seeding initial library catalog, physical racks, authors, and members...");

        // 1. Authors
        Author robertMartin = authorRepository.save(new Author("Robert C. Martin", "Author of Clean Code and software craftsman"));
        Author joshuaBloch = authorRepository.save(new Author("Joshua Bloch", "Author of Effective Java"));
        Author martinKleppmann = authorRepository.save(new Author("Martin Kleppmann", "Author of Designing Data-Intensive Applications"));
        Author andrewHunt = authorRepository.save(new Author("Andrew Hunt", "Co-author of The Pragmatic Programmer"));

        // 2. Categories
        Category softwareEng = categoryRepository.save(new Category("Software Engineering", "Software design principles and clean code"));
        Category distSystems = categoryRepository.save(new Category("Distributed Systems", "Cloud architecture, scalability, consensus"));
        Category algorithms = categoryRepository.save(new Category("Algorithms", "Data structures and algorithm design"));

        // 3. Books on Physical Racks
        createBook(
                "978-0132350884",
                "Clean Code",
                "A Handbook of Agile Software Craftsmanship",
                "Prentice Hall",
                2008,
                "Even bad code can function. But if code isn't clean, it can bring an organization to its knees.",
                5,
                4,
                "Rack A-1 (Shelf CS-01)",
                "https://images.unsplash.com/photo-1532012164546-f432f2e3edd1?w=400",
                Set.of(robertMartin),
                Set.of(softwareEng)
        );

        createBook(
                "978-0134685991",
                "Effective Java",
                "Best Practices for the Java Platform",
                "Addison-Wesley",
                2018,
                "The definitive guide to modern Java best practices and design patterns.",
                4,
                4,
                "Rack A-1 (Shelf CS-02)",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
                Set.of(joshuaBloch),
                Set.of(softwareEng)
        );

        createBook(
                "978-1449373320",
                "Designing Data-Intensive Applications",
                "The Big Ideas Behind Reliable, Scalable Systems",
                "O'Reilly Media",
                2017,
                "Comprehensive architecture patterns for distributed data systems.",
                6,
                3,
                "Rack B-2 (Shelf DS-01)",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
                Set.of(martinKleppmann),
                Set.of(distSystems)
        );

        createBook(
                "978-0135957059",
                "The Pragmatic Programmer",
                "Your Journey to Mastery",
                "Addison-Wesley",
                2019,
                "Timeless advice on career growth, engineering discipline, and craftsmanship.",
                4,
                4,
                "Rack A-2 (Shelf CS-03)",
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
                Set.of(andrewHunt),
                Set.of(softwareEng)
        );

        // 4. Sample Members
        createMember("Alice", "Johnson", "MEM-2026-0001", "alice.johnson@example.com", "+1 555-0199", "452 University Ave");
        createMember("Bob", "Smith", "MEM-2026-0002", "bob.smith@example.com", "+1 555-0288", "88 Faculty Way");

        log.info("Catalog seeding completed successfully! {} books now available.", bookRepository.count());
    }

    private void createBook(
            String isbn,
            String title,
            String subtitle,
            String publisher,
            int year,
            String description,
            int totalCopies,
            int availableCopies,
            String shelfLocation,
            String coverUrl,
            Set<Author> authors,
            Set<Category> categories) {

        Book book = new Book();
        book.setIsbn(isbn);
        book.setTitle(title);
        book.setSubtitle(subtitle);
        book.setPublisher(publisher);
        book.setPublicationYear(year);
        book.setDescription(description);
        book.setLanguage("English");
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(availableCopies);
        book.setShelfLocation(shelfLocation);
        book.setCoverImageUrl(coverUrl);
        book.setStatus(BookStatus.ACTIVE);
        book.setAuthors(authors);
        book.setCategories(categories);
        book.setCreatedAt(Instant.now());
        book.setUpdatedAt(Instant.now());
        bookRepository.save(book);
    }

    private void createMember(String firstName, String lastName, String memberNum, String email, String phone, String address) {
        Member member = new Member();
        member.setFirstName(firstName);
        member.setLastName(lastName);
        member.setMembershipNumber(memberNum);
        member.setEmail(email);
        member.setPhone(phone);
        member.setAddress(address);
        member.setStatus(MemberStatus.ACTIVE);
        member.setMaxLoans(5);
        member.setRegistrationDate(LocalDate.now());
        member.setCreatedAt(Instant.now());
        member.setUpdatedAt(Instant.now());
        memberRepository.save(member);
    }
}
