package com.zeronet.service;

import com.zeronet.dto.ContactItemDto;
import com.zeronet.model.UserContact;
import com.zeronet.model.UserPhoneAccount;
import com.zeronet.repository.UserContactRepository;
import com.zeronet.repository.UserPhoneAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ContactService {

    private final UserContactRepository contactRepo;
    private final UserPhoneAccountRepository phoneRepo;
    private final PhoneNumberNormalizationService phoneNormalizer;
    private final UserPrivacyService privacyService;

    public ContactService(UserContactRepository contactRepo,
                          UserPhoneAccountRepository phoneRepo,
                          PhoneNumberNormalizationService phoneNormalizer,
                          UserPrivacyService privacyService) {
        this.contactRepo = contactRepo;
        this.phoneRepo = phoneRepo;
        this.phoneNormalizer = phoneNormalizer;
        this.privacyService = privacyService;
    }

    @Transactional
    public List<ContactItemDto> syncContacts(String userId, List<ContactItemDto> incoming) {
        if (incoming == null || incoming.isEmpty()) {
            return getContacts(userId);
        }

        long now = System.currentTimeMillis();
        for (ContactItemDto item : incoming) {
            if (item.getPhoneNumber() == null || item.getPhoneNumber().isBlank()) continue;

            PhoneNumberNormalizationService.NormalizedPhone norm = phoneNormalizer.normalize(item.getPhoneNumber(), "IN");
            if (!norm.isValid()) continue;

            String e164 = norm.e164();
            Optional<UserContact> existing = contactRepo.findByUserIdAndContactPhoneE164(userId, e164);
            if (existing.isEmpty()) {
                String contactName = (item.getName() != null && !item.getName().isBlank())
                        ? item.getName().trim()
                        : "Contact " + e164.substring(Math.max(0, e164.length() - 4));

                UserContact contact = new UserContact(
                        UUID.randomUUID().toString(),
                        userId,
                        e164,
                        contactName,
                        now
                );
                contactRepo.save(contact);
            }
        }

        return getContacts(userId);
    }

    public List<ContactItemDto> getContacts(String userId) {
        List<UserContact> contacts = contactRepo.findByUserId(userId);
        List<ContactItemDto> result = new ArrayList<>();

        for (UserContact c : contacts) {
            Optional<UserPhoneAccount> optAcc = phoneRepo.findByPhoneNumberE164AndIsVerifiedTrue(c.getContactPhoneE164());
            boolean isRegistered = false;
            String peerUserId = null;

            if (optAcc.isPresent()) {
                UserPhoneAccount acc = optAcc.get();
                if (privacyService.canDiscover(userId, acc.getUserId(), acc.getPhoneNumberE164())) {
                    isRegistered = true;
                    peerUserId = acc.getUserId();
                }
            }

            result.add(new ContactItemDto(c.getContactName(), c.getContactPhoneE164(), isRegistered, peerUserId));
        }

        return result;
    }
}
