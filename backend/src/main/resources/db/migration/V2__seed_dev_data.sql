-- V2__seed_dev_data.sql
-- Comprehensive Seed Data for Books, Members, and Loans (Available & Issued)

-- 1. Seed Users
INSERT INTO users (id, username, email, password_hash, full_name, role, active)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@library.local', '$2a$12$J2HMiMXIph0rXpadwJKRwu6ButpNpH1n0yNHq/GIGt5t1bC2E0vyG', 'System Administrator', 'ADMIN', TRUE),
('22222222-2222-2222-2222-222222222222', 'librarian', 'librarian@library.local', '$2a$12$J2HMiMXIph0rXpadwJKRwu6ButpNpH1n0yNHq/GIGt5t1bC2E0vyG', 'Senior Librarian', 'LIBRARIAN', TRUE),
('33333333-3333-3333-3333-333333333333', 'member', 'member@library.local', '$2a$12$J2HMiMXIph0rXpadwJKRwu6ButpNpH1n0yNHq/GIGt5t1bC2E0vyG', 'Alice Reader', 'MEMBER', TRUE)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. Seed Authors
INSERT INTO authors (id, name, bio)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Robert C. Martin', 'Renowned software engineer, author of Clean Code and Clean Architecture.'),
('a2222222-2222-2222-2222-222222222222', 'Martin Fowler', 'Chief Scientist at ThoughtWorks, author of Refactoring and Enterprise Integration Patterns.'),
('a3333333-3333-3333-3333-333333333333', 'Joshua Bloch', 'Author of Effective Java, former Chief Java Architect at Google.'),
('a4444444-4444-4444-4444-444444444444', 'Eric Evans', 'Domain-Driven Design pioneer and founder of Domain Language.'),
('a5555555-5555-5555-5555-555555555555', 'F. Scott Fitzgerald', 'Iconic 20th century American novelist.'),
('a6666666-6666-6666-6666-666666666666', 'Martin Kleppmann', 'Researcher in distributed systems and author of Designing Data-Intensive Applications.'),
('a7777777-7777-7777-7777-777777777777', 'David Thomas & Andrew Hunt', 'Pioneers of pragmatic software craftsmanship.'),
('a8888888-8888-8888-8888-888888888888', 'Sam Newman', 'Cloud and microservices architecture specialist.'),
('a9999999-9999-9999-9999-999999999999', 'Alex Xu', 'Author and software architect specializing in large-scale system design.'),
('a0000000-0000-0000-0000-000000000001', 'Thomas H. Cormen', 'Co-author of the renowned algorithms reference book CLRS.'),
('a0000000-0000-0000-0000-000000000002', 'George Orwell', 'Celebrated English novelist, essayist, and critic.'),
('a0000000-0000-0000-0000-000000000003', 'Harper Lee', 'Pulitzer Prize-winning author of To Kill a Mockingbird.')
ON CONFLICT DO NOTHING;

-- 3. Seed Categories
INSERT INTO categories (id, name, description)
VALUES
('c1111111-1111-1111-1111-111111111111', 'Software Engineering', 'Books about software design, architecture, and engineering practices.'),
('c2222222-2222-2222-2222-222222222222', 'Computer Science & Algorithms', 'Foundational computer science, data structures, algorithms, and systems.'),
('c3333333-3333-3333-3333-333333333333', 'Classic Literature', 'Timeless literary masterpieces and historic fiction.'),
('c4444444-4444-4444-4444-444444444444', 'Distributed Systems & Cloud', 'Architecting resilient cloud applications, microservices, and databases.'),
('c5555555-5555-5555-5555-555555555555', 'System Design & Architecture', 'Scalability, high availability, and interview architecture design.')
ON CONFLICT (name) DO NOTHING;

-- 4. Seed Books (Available & Issued Inventory)
INSERT INTO books (id, isbn, title, subtitle, publisher, publication_year, description, language, total_copies, available_copies, shelf_location, cover_image_url, status)
VALUES
-- Book 1 (Partially Issued: 4 available / 5 total)
('b1111111-1111-1111-1111-111111111111', '978-0132350884', 'Clean Code', 'A Handbook of Agile Software Craftsmanship', 'Prentice Hall', 2008, 'Even bad code can function. But if code isn''t clean, it can bring a development organization to its knees.', 'English', 5, 4, 'Shelf CS-01', 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd1?w=400', 'ACTIVE'),

-- Book 2 (Available: 4 available / 4 total)
('b2222222-2222-2222-2222-222222222222', '978-0134685991', 'Effective Java', 'Best practices for the Java platform', 'Addison-Wesley', 2018, 'The definitive guide to best practices in modern Java programming.', 'English', 4, 4, 'Shelf CS-02', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 'ACTIVE'),

-- Book 3 (Partially Issued: 1 available / 3 total)
('b3333333-3333-3333-3333-333333333333', '978-0321125217', 'Domain-Driven Design', 'Tackling Complexity in the Heart of Software', 'Addison-Wesley', 2003, 'A systematic approach to domain-driven design for complex systems.', 'English', 3, 1, 'Shelf CS-03', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', 'ACTIVE'),

-- Book 4 (Partially Issued: 3 available / 5 total)
('b4444444-4444-4444-4444-444444444444', '978-1449373320', 'Designing Data-Intensive Applications', 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems', 'O''Reilly Media', 2017, 'The definitive guide to the architecture and internals of modern distributed data systems.', 'English', 5, 3, 'Shelf DS-01', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', 'ACTIVE'),

-- Book 5 (Available: 4 available / 4 total)
('b5555555-5555-5555-5555-555555555555', '978-0135957059', 'The Pragmatic Programmer', 'Your Journey to Mastery (20th Anniversary Edition)', 'Addison-Wesley', 2019, 'Timeless wisdom on software craftsmanship, career growth, and engineering discipline.', 'English', 4, 4, 'Shelf CS-04', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400', 'ACTIVE'),

-- Book 6 (Fully Issued / Out of Stock: 0 available / 3 total)
('b6666666-6666-6666-6666-666666666666', '978-1492043454', 'Building Microservices', 'Designing Fine-Grained Systems (2nd Edition)', 'O''Reilly Media', 2021, 'Comprehensive advice on modeling, integrating, testing, and deploying distributed microservices.', 'English', 3, 0, 'Shelf MS-01', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', 'ACTIVE'),

-- Book 7 (Partially Issued: 2 available / 4 total)
('b7777777-7777-7777-7777-777777777777', '978-1736049112', 'System Design Interview', 'An Insider''s Guide (Volume 1)', 'Independently published', 2020, 'Step-by-step blueprints for architecting high-scale distributed systems and web architectures.', 'English', 4, 2, 'Shelf SD-01', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400', 'ACTIVE'),

-- Book 8 (Available: 5 available / 6 total)
('b8888888-8888-8888-8888-888888888888', '978-0262046305', 'Introduction to Algorithms (CLRS)', 'Fourth Edition', 'MIT Press', 2022, 'The standard comprehensive textbook on data structures, graph theory, and algorithmic complexity.', 'English', 6, 5, 'Shelf ALG-01', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', 'ACTIVE'),

-- Book 9 (Partially Issued: 5 available / 6 total)
('b9999999-9999-9999-9999-999999999999', '978-0743273565', 'The Great Gatsby', 'A Novel of the Jazz Age', 'Scribner', 1925, 'The story of the fabulously wealthy Jay Gatsby and his new love for Daisy Buchanan.', 'English', 6, 5, 'Shelf LIT-01', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'ACTIVE'),

-- Book 10 (Fully Issued: 0 available / 2 total)
('b0000000-0000-0000-0000-000000000001', '978-0451524935', '1984', 'A Dystopian Masterpiece', 'Signet Classics', 1949, 'A chilling prophecy about totalitarian surveillance, psychological control, and the manipulation of truth.', 'English', 2, 0, 'Shelf LIT-02', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400', 'ACTIVE'),

-- Book 11 (Available: 4 available / 4 total)
('b0000000-0000-0000-0000-000000000002', '978-0061120084', 'To Kill a Mockingbird', '50th Anniversary Edition', 'Harper Perennial', 1960, 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.', 'English', 4, 4, 'Shelf LIT-03', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', 'ACTIVE')
ON CONFLICT (isbn) DO UPDATE SET 
  total_copies = EXCLUDED.total_copies, 
  available_copies = EXCLUDED.available_copies, 
  shelf_location = EXCLUDED.shelf_location,
  cover_image_url = EXCLUDED.cover_image_url;

-- 5. Book Authors associations
INSERT INTO book_authors (book_id, author_id)
VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333'),
('b3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444'),
('b4444444-4444-4444-4444-444444444444', 'a6666666-6666-6666-6666-666666666666'),
('b5555555-5555-5555-5555-555555555555', 'a7777777-7777-7777-7777-777777777777'),
('b6666666-6666-6666-6666-666666666666', 'a8888888-8888-8888-8888-888888888888'),
('b7777777-7777-7777-7777-777777777777', 'a9999999-9999-9999-9999-999999999999'),
('b8888888-8888-8888-8888-888888888888', 'a0000000-0000-0000-0000-000000000001'),
('b9999999-9999-9999-9999-999999999999', 'a5555555-5555-5555-5555-555555555555'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 6. Book Categories associations
INSERT INTO book_categories (book_id, category_id)
VALUES
('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
('b3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111'),
('b4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444'),
('b5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111'),
('b6666666-6666-6666-6666-666666666666', 'c4444444-4444-4444-4444-444444444444'),
('b7777777-7777-7777-7777-777777777777', 'c5555555-5555-5555-5555-555555555555'),
('b8888888-8888-8888-8888-888888888888', 'c2222222-2222-2222-2222-222222222222'),
('b9999999-9999-9999-9999-999999999999', 'c3333333-3333-3333-3333-333333333333'),
('b0000000-0000-0000-0000-000000000001', 'c3333333-3333-3333-3333-333333333333'),
('b0000000-0000-0000-0000-000000000002', 'c3333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- 7. Seed Members
INSERT INTO members (id, membership_number, first_name, last_name, email, phone, address, status, max_loans, registration_date)
VALUES
('d1111111-1111-1111-1111-111111111111', 'MEM-2026-0001', 'Alice', 'Reader', 'alice.reader@example.com', '+1-555-0101', '101 Library Way, Silicon Valley', 'ACTIVE', 5, CURRENT_DATE - INTERVAL '120 days'),
('d2222222-2222-2222-2222-222222222222', 'MEM-2026-0002', 'Bob', 'Smith', 'bob.smith@example.com', '+1-555-0102', '202 Oak Avenue, Metro City', 'ACTIVE', 5, CURRENT_DATE - INTERVAL '90 days'),
('d3333333-3333-3333-3333-333333333333', 'MEM-2026-0003', 'Charlie', 'Brown', 'charlie.brown@example.com', '+1-555-0103', '303 Pine Lane, Greenfield', 'SUSPENDED', 3, CURRENT_DATE - INTERVAL '60 days'),
('d4444444-4444-4444-4444-444444444444', 'MEM-2026-0004', 'Diana', 'Prince', 'diana.prince@example.com', '+1-555-0104', '404 Amazonia Blvd, Gateway City', 'ACTIVE', 5, CURRENT_DATE - INTERVAL '30 days'),
('d5555555-5555-5555-5555-555555555555', 'MEM-2026-0005', 'Evan', 'Wright', 'evan.wright@example.com', '+1-555-0105', '505 Tech Parkway, Innovation Hub', 'ACTIVE', 5, CURRENT_DATE - INTERVAL '15 days')
ON CONFLICT (membership_number) DO NOTHING;

-- 8. Seed Active and Issued Loans (Demonstrating Issued Books and Overdue Records)
INSERT INTO loans (id, loan_number, book_id, member_id, issued_by, issue_date, due_date, status, renewal_count, notes)
VALUES
-- Loan 1: Clean Code issued to Alice
('e1111111-1111-1111-1111-111111111111', 'TXN-2026-0001', 'b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP + INTERVAL '10 days', 'ISSUED', 0, 'Standard 14-day loan'),

-- Loan 2: Domain-Driven Design issued to Bob
('e2222222-2222-2222-2222-222222222222', 'TXN-2026-0002', 'b3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '12 days', 'ISSUED', 0, 'Architectural research loan'),

-- Loan 3: Designing Data-Intensive Applications issued to Diana (Active)
('e3333333-3333-3333-3333-333333333333', 'TXN-2026-0003', 'b4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '9 days', 'ISSUED', 1, 'Extended 14-day renewal'),

-- Loan 4: Building Microservices issued to Evan (Active)
('e4444444-4444-4444-4444-444444444444', 'TXN-2026-0004', 'b6666666-6666-6666-6666-666666666666', 'd5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '7 days', 'ISSUED', 0, 'Microservices study group loan'),

-- Loan 5: 1984 issued to Charlie (OVERDUE: due date passed 3 days ago)
('e5555555-5555-5555-5555-555555555555', 'TXN-2026-0005', 'b0000000-0000-0000-0000-000000000001', 'd3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '17 days', CURRENT_TIMESTAMP - INTERVAL '3 days', 'OVERDUE', 0, 'Overdue alert triggered. Fine accrued.'),

-- Loan 6: System Design Interview issued to Alice
('e6666666-6666-6666-6666-666666666666', 'TXN-2026-0006', 'b7777777-7777-7777-7777-777777777777', 'd1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '13 days', 'ISSUED', 0, 'System design preparation')
ON CONFLICT (loan_number) DO NOTHING;
