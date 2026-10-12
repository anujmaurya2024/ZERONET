package com.zeronet.service;

import com.zeronet.model.UserBlock;
import com.zeronet.model.UserPrivacySettings;
import com.zeronet.repository.UserBlockRepository;
import com.zeronet.repository.UserContactRepository;
import com.zeronet.repository.UserPrivacySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserPrivacyService {

    private final UserPrivacySettingsRepository privacyRepo;
    private final UserBlockRepository blockRepo;
    private final UserContactRepository contactRepo;

    public UserPrivacyService(UserPrivacySettingsRepository privacyRepo,
                              UserBlockRepository blockRepo,
                              UserContactRepository contactRepo) {
        this.privacyRepo = privacyRepo;
        this.blockRepo = blockRepo;
        this.contactRepo = contactRepo;
    }

    public UserPrivacySettings getPrivacySettings(String userId) {
        return privacyRepo.findByUserId(userId).orElseGet(() -> {
            long now = System.currentTimeMillis();
            UserPrivacySettings s = new UserPrivacySettings(
                    userId,
                    "EVERYONE", // discoveryVisibility
                    "CONTACTS", // phoneVisibility
                    true,       // allowContactDiscovery
                    true,       // allowMessageRequests
                    now,
                    now
            );
            return privacyRepo.save(s);
        });
    }

    @Transactional
    public UserPrivacySettings updatePrivacySettings(String userId, UserPrivacySettings updated) {
        UserPrivacySettings current = getPrivacySettings(userId);
        if (updated.getDiscoveryVisibility() != null) {
            current.setDiscoveryVisibility(updated.getDiscoveryVisibility());
        }
        if (updated.getPhoneVisibility() != null) {
            current.setPhoneVisibility(updated.getPhoneVisibility());
        }
        current.setAllowContactDiscovery(updated.isAllowContactDiscovery());
        current.setAllowMessageRequests(updated.isAllowMessageRequests());
        current.setUpdatedAt(System.currentTimeMillis());
        return privacyRepo.save(current);
    }

    public boolean isBlocked(String userOneId, String userTwoId) {
        return blockRepo.existsByUserIdAndBlockedUserId(userOneId, userTwoId)
                || blockRepo.existsByUserIdAndBlockedUserId(userTwoId, userOneId);
    }

    @Transactional
    public boolean blockUser(String blockerId, String targetUserId, String reason) {
        if (blockerId.equals(targetUserId)) return false;
        if (!blockRepo.existsByUserIdAndBlockedUserId(blockerId, targetUserId)) {
            UserBlock block = new UserBlock(
                    UUID.randomUUID().toString(),
                    blockerId,
                    targetUserId,
                    reason,
                    System.currentTimeMillis()
            );
            blockRepo.save(block);
        }
        return true;
    }

    @Transactional
    public boolean unblockUser(String blockerId, String targetUserId) {
        Optional<UserBlock> block = blockRepo.findByUserIdAndBlockedUserId(blockerId, targetUserId);
        if (block.isPresent()) {
            blockRepo.delete(block.get());
            return true;
        }
        return false;
    }

    public List<UserBlock> getBlockedUsers(String userId) {
        return blockRepo.findByUserId(userId);
    }

    /**
     * Determines whether viewer is permitted to discover targetUser by their mobile number.
     */
    public boolean canDiscover(String viewerId, String targetUserId, String targetE164) {
        if (viewerId.equals(targetUserId)) return true;
        if (isBlocked(viewerId, targetUserId)) return false;

        UserPrivacySettings targetSettings = getPrivacySettings(targetUserId);
        String visibility = targetSettings.getDiscoveryVisibility();

        if ("NOBODY".equalsIgnoreCase(visibility)) {
            return false;
        }

        if ("CONTACTS".equalsIgnoreCase(visibility)) {
            // Permitted only if target has viewer in their contacts, or viewer has target's phone in their contacts
            boolean inTargetContacts = contactRepo.existsByUserIdAndContactPhoneE164(targetUserId, targetE164);
            boolean inViewerContacts = contactRepo.findByUserId(viewerId).stream()
                    .anyMatch(c -> c.getContactPhoneE164().equals(targetE164));
            return inTargetContacts || inViewerContacts;
        }

        return true; // EVERYONE
    }

    /**
     * Determines whether viewer is permitted to see the target's unmasked mobile number.
     */
    public boolean canSeeFullPhoneNumber(String viewerId, String targetUserId, String targetE164) {
        if (viewerId.equals(targetUserId)) return true;
        if (isBlocked(viewerId, targetUserId)) return false;

        UserPrivacySettings targetSettings = getPrivacySettings(targetUserId);
        String visibility = targetSettings.getPhoneVisibility();

        if ("EVERYONE".equalsIgnoreCase(visibility)) {
            return true;
        }
        if ("NOBODY".equalsIgnoreCase(visibility)) {
            return false;
        }
        // CONTACTS
        return contactRepo.findByUserId(viewerId).stream()
                .anyMatch(c -> c.getContactPhoneE164().equals(targetE164));
    }
}
