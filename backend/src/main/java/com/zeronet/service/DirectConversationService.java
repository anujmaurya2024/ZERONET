package com.zeronet.service;

import com.zeronet.dto.DirectConversationResponse;
import com.zeronet.model.DirectConversation;
import com.zeronet.model.UserPhoneAccount;
import com.zeronet.repository.DirectConversationRepository;
import com.zeronet.repository.UserPhoneAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class DirectConversationService {

    private final DirectConversationRepository directRepo;
    private final UserPhoneAccountRepository phoneRepo;
    private final UserPrivacyService privacyService;

    public DirectConversationService(DirectConversationRepository directRepo,
                                     UserPhoneAccountRepository phoneRepo,
                                     UserPrivacyService privacyService) {
        this.directRepo = directRepo;
        this.phoneRepo = phoneRepo;
        this.privacyService = privacyService;
    }

    /**
     * Finds or creates a canonical 1-to-1 conversation between userOne and userTwo.
     */
    @Transactional
    public DirectConversationResponse getOrCreateDirectConversation(String currentUserId, String targetUserId) {
        if (currentUserId == null || targetUserId == null || currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot create conversation with self or invalid user ID");
        }

        if (privacyService.isBlocked(currentUserId, targetUserId)) {
            throw new IllegalStateException("Cannot start conversation with a blocked user");
        }

        // Canonical sorted order
        String first = currentUserId.compareTo(targetUserId) < 0 ? currentUserId : targetUserId;
        String second = currentUserId.compareTo(targetUserId) < 0 ? targetUserId : currentUserId;

        Optional<DirectConversation> existing = directRepo.findByUserOneIdAndUserTwoId(first, second);
        String peerName = phoneRepo.findByUserId(targetUserId)
                .map(UserPhoneAccount::getDisplayName)
                .orElse("User " + targetUserId.substring(Math.max(0, targetUserId.length() - 5)));

        if (existing.isPresent()) {
            DirectConversation conv = existing.get();
            return new DirectConversationResponse(
                    conv.getId(),
                    first,
                    second,
                    targetUserId,
                    peerName,
                    true
            );
        }

        long now = System.currentTimeMillis();
        String convId = "conv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        DirectConversation newConv = new DirectConversation(convId, first, second, now, now);
        directRepo.save(newConv);

        return new DirectConversationResponse(
                convId,
                first,
                second,
                targetUserId,
                peerName,
                false
        );
    }
}
