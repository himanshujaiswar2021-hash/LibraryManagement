package com.library.audit.service;

import com.library.audit.domain.AuditEvent;
import com.library.audit.repository.AuditEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditEvent recordEvent(UUID userId, String username, String eventType, String entityType, String entityId, String ipAddress, String details) {
        logger.info("Audit event: [{}] on {} ({}) by user {} ({})", eventType, entityType, entityId, username, userId);
        AuditEvent event = new AuditEvent(userId, username, eventType, entityType, entityId, ipAddress, details);
        return auditEventRepository.save(event);
    }

    @Async
    public void recordEventAsync(UUID userId, String username, String eventType, String entityType, String entityId, String ipAddress, String details) {
        try {
            recordEvent(userId, username, eventType, entityType, entityId, ipAddress, details);
        } catch (Exception e) {
            logger.error("Failed to record audit event asynchronously", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> searchAuditEvents(String eventType, String entityType, String entityId, String username, Instant fromDate, Instant toDate, Pageable pageable) {
        return auditEventRepository.searchAuditEvents(eventType, entityType, entityId, username, fromDate, toDate, pageable);
    }
}
