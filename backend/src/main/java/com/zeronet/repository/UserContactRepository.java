package com.zeronet.repository;

import com.zeronet.model.UserContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserContactRepository extends JpaRepository<UserContact, String> {
    List<UserContact> findByUserId(String userId);
    Optional<UserContact> findByUserIdAndContactPhoneE164(String userId, String contactPhoneE164);
    boolean existsByUserIdAndContactPhoneE164(String userId, String contactPhoneE164);
}
