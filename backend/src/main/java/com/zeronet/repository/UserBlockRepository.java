package com.zeronet.repository;

import com.zeronet.model.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, String> {
    List<UserBlock> findByUserId(String userId);
    Optional<UserBlock> findByUserIdAndBlockedUserId(String userId, String blockedUserId);
    boolean existsByUserIdAndBlockedUserId(String userId, String blockedUserId);
}
