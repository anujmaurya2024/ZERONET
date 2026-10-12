package com.zeronet.service;

import com.zeronet.dto.UserSearchResultDto;
import com.zeronet.model.UserPhoneAccount;
import com.zeronet.repository.UserContactRepository;
import com.zeronet.repository.UserPhoneAccountRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserDiscoveryService {

    private final UserPhoneAccountRepository phoneRepo;
    private final PhoneNumberNormalizationService phoneNormalizer;
    private final UserPrivacyService privacyService;
    private final UserContactRepository contactRepo;

    public UserDiscoveryService(UserPhoneAccountRepository phoneRepo,
                                PhoneNumberNormalizationService phoneNormalizer,
                                UserPrivacyService privacyService,
                                UserContactRepository contactRepo) {
        this.phoneRepo = phoneRepo;
        this.phoneNormalizer = phoneNormalizer;
        this.privacyService = privacyService;
        this.contactRepo = contactRepo;
    }

    /**
     * Searches for registered and verified users by mobile number or display name.
     */
    public List<UserSearchResultDto> searchUsers(String searcherId, String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        String cleaned = query.trim();
        List<UserSearchResultDto> results = new ArrayList<>();

        // 1. Check if the query is a phone number
        PhoneNumberNormalizationService.NormalizedPhone norm = phoneNormalizer.normalize(cleaned, "IN");
        if (norm.isValid()) {
            String e164 = norm.e164();
            Optional<UserPhoneAccount> optAcc = phoneRepo.findByPhoneNumberE164AndIsVerifiedTrue(e164);
            if (optAcc.isPresent()) {
                UserPhoneAccount target = optAcc.get();
                // Check privacy
                if (privacyService.canDiscover(searcherId, target.getUserId(), target.getPhoneNumberE164())) {
                    boolean canSeeFull = privacyService.canSeeFullPhoneNumber(searcherId, target.getUserId(), target.getPhoneNumberE164());
                    String displayPhone = canSeeFull ? target.getPhoneNumberE164() : phoneNormalizer.maskPhoneNumber(target.getPhoneNumberE164());
                    boolean isContact = contactRepo.existsByUserIdAndContactPhoneE164(searcherId, target.getPhoneNumberE164());

                    results.add(new UserSearchResultDto(
                            target.getUserId(),
                            target.getDisplayName() != null ? target.getDisplayName() : "WhatsApp User",
                            displayPhone,
                            true, // reachable
                            isContact,
                            !privacyService.isBlocked(searcherId, target.getUserId()),
                            resolveAvatarColor(target.getUserId())
                    ));
                    return results;
                }
            }
            // If phone was not found or discovery is restricted, return empty list (prevents enumeration)
            return List.of();
        }

        // 2. Search by display name among verified users
        List<UserPhoneAccount> allVerified = phoneRepo.findAll().stream()
                .filter(UserPhoneAccount::isVerified)
                .toList();

        for (UserPhoneAccount acc : allVerified) {
            if (acc.getUserId().equals(searcherId)) continue;
            if (privacyService.isBlocked(searcherId, acc.getUserId())) continue;

            String name = acc.getDisplayName();
            if (name != null && name.toLowerCase().contains(cleaned.toLowerCase())) {
                if (privacyService.canDiscover(searcherId, acc.getUserId(), acc.getPhoneNumberE164())) {
                    boolean canSeeFull = privacyService.canSeeFullPhoneNumber(searcherId, acc.getUserId(), acc.getPhoneNumberE164());
                    String displayPhone = canSeeFull ? acc.getPhoneNumberE164() : phoneNormalizer.maskPhoneNumber(acc.getPhoneNumberE164());
                    boolean isContact = contactRepo.existsByUserIdAndContactPhoneE164(searcherId, acc.getPhoneNumberE164());

                    results.add(new UserSearchResultDto(
                            acc.getUserId(),
                            name,
                            displayPhone,
                            true,
                            isContact,
                            true,
                            resolveAvatarColor(acc.getUserId())
                    ));
                }
            }
        }

        return results;
    }

    private String resolveAvatarColor(String id) {
        String[] colors = {"#00a884", "#25d366", "#128c7e", "#34b7f1", "#008069", "#00a884"};
        int hash = Math.abs(id.hashCode());
        return colors[hash % colors.length];
    }
}
