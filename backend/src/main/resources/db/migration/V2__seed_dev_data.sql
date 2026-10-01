-- V2__seed_dev_data.sql
-- Development and Integration Seed Data

-- 1. Seed Users (passwords are BCrypt hash of 'admin123', 'librarian123', 'member123')
-- BCrypt for 'admin123': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- BCrypt for 'librarian123': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- BCrypt for 'member123': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
INSERT INTO users (id, username, email, password_hash, full_name, role, active)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@library.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'System Administrator', 'ADMIN', TRUE),
('22222222-2222-2222-2222-222222222222', 'librarian', 'librarian@library.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Senior Librarian', 'LIBRARIAN', TRUE),
('33333333-3333-3333-3333-333333333333', 'member', 'member@library.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Alice Reader', 'MEMBER', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 2. Seed Authors
INSERT INTO authors (id, name, bio)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Robert C. Martin', 'Renowned software engineer, author of Clean Code and Clean Architecture.'),
('a2222222-2222-2222-2222-222222222222', 'Martin Fowler', 'Chief Scientist at ThoughtWorks, author of Refactoring and Enterprise Integration Patterns.'),
('a3333333-3333-3333-3333-333333333333', 'Joshua Bloch', 'Author of Effective Java, former Chief Java Architect at Google.'),
('a4444444-4444-4444-4444-444444444444', 'Eric Evans', 'Domain-Driven Design pioneer and founder of Domain Language.'),
('a5555555-5555-5555-5555-555555555555', 'F. Scott Fitzgerald', 'Iconic 20th century American novelist.')
ON CONFLICT DO NOTHING;

-- 3. Seed Categories
INSERT INTO categories (id, name, description)
VALUES
('c1111111-1111-1111-1111-111111111111', 'Software Engineering', 'Books about software design, architecture, and engineering practices.'),
('c2222222-2222-2222-2222-222222222222', 'Computer Science', 'Foundational computer science, algorithms, and systems.'),
('c3333333-3333-3333-3333-333333333333', 'Classic Literature', 'Timeless literary masterpieces and historic fiction.')
ON CONFLICT (name) DO NOTHING;

-- 4. Seed Books
INSERT INTO books (id, isbn, title, subtitle, publisher, publication_year, description, language, total_copies, available_copies, shelf_location, cover_image_url, status)
VALUES
('b1111111-1111-1111-1111-111111111111', '978-0132350884', 'Clean Code', 'A Handbook of Agile Software Craftsmanship', 'Prentice Hall', 2008, 'Even bad code can function. But if code isn''t clean, it can bring a development organization to its knees.', 'English', 5, 4, 'Shelf CS-01', 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd1?w=400', 'ACTIVE'),
('b2222222-2222-2222-2222-222222222222', '978-0134685991', 'Effective Java', 'Best practices for the Java platform', 'Addison-Wesley', 2018, 'The definitive guide to best practices in modern Java programming.', 'English', 4, 4, 'Shelf CS-02', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 'ACTIVE'),
('b3333333-3333-3333-3333-333333333333', '978-0321125217', 'Domain-Driven Design', 'Tackling Complexity in the Heart of Software', 'Addison-Wesley', 2003, 'A systematic approach to domain-driven design for complex systems.', 'English', 3, 2, 'Shelf CS-03', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', 'ACTIVE'),
('b4444444-4444-4444-4444-444444444444', '978-0743273565', 'The Great Gatsby', 'A Novel of the Jazz Age', 'Scribner', 1925, 'The story of the fabulously wealthy Jay Gatsby and his new love for the beautiful Daisy Buchanan.', 'English', 6, 6, 'Shelf LIT-01', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'ACTIVE')
ON CONFLICT (isbn) DO NOTHING;

-- 5. Book Authors associations
INSERT INTO book_authors (book_id, author_id)
VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333'),
('b3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444'),
('b4444444-4444-4444-4444-444444444444', 'a5555555-5555-5555-5555-555555555555')
ON CONFLICT DO NOTHING;

-- 6. Book Categories associations
INSERT INTO book_categories (book_id, category_id)
VALUES
('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
('b3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111'),
('b4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- 7. Seed Members
INSERT INTO members (id, membership_number, first_name, last_name, email, phone, address, status, max_loans, registration_date)
VALUES
('m1111111-1111-1111-1111-111111111111', 'MEM-2026-0001', 'Alice', 'Reader', 'member@library.local', '+1-555-0101', '101 Library Way, Silicon Valley', 'ACTIVE', 5, CURRENT_DATE),
('m2222222-2222-2222-2222-222222222222', 'MEM-2026-0002', 'Bob', 'Smith', 'bob.smith@example.com', '+1-555-0102', '202 Oak Avenue, Metro City', 'ACTIVE', 5, CURRENT_DATE),
('m3333333-3333-3333-3333-333333333333', 'MEM-2026-0003', 'Charlie', 'Brown', 'charlie.brown@example.com', '+1-555-0103', '303 Pine Lane, Greenfield', 'SUSPENDED', 3, CURRENT_DATE)
ON CONFLICT (membership_number) DO NOTHING;

-- 8. Seed Initial Active Loan
INSERT INTO loans (id, loan_number, book_id, member_id, issued_by, issue_date, due_date, status, renewal_count, notes)
VALUES
('l1111111-1111-1111-1111-111111111111', 'TXN-2026-0001', 'b1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '11 days', 'ISSUED', 0, 'Standard loan')
ON CONFLICT (loan_number) DO NOTHING;
