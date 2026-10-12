package com.zeronet.repository;

import com.zeronet.model.DirectConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DirectConversationRepository extends JpaRepository<DirectConversation, String> {
    Optional<DirectConversation> findByUserOneIdAndUserTwoId(String userOneId, String userTwoId);

    @Query("SELECT d FROM DirectConversation d WHERE d.userOneId = :userId OR d.userTwoId = :userId ORDER BY d.updatedAt DESC")
    List<DirectConversation> findAllForUser(@Param("userId") String userId);
}
