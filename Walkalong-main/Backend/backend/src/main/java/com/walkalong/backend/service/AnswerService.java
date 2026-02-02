package com.walkalong.backend.service;

import com.walkalong.backend.entity.*;
import com.walkalong.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

@Service
public class AnswerService {
    @Autowired private AnswerQuestionRepository questionRepository;
    @Autowired private AnswerSubmissionRepository submissionRepository;
    @Autowired private AnswerReviewRepository reviewRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private FileStorageService fileStorageService;

    public AnswerQuestion createQuestion(AnswerQuestion question) {
        return questionRepository.save(question);
    }

    public List<AnswerQuestion> getAllQuestions() {
        return questionRepository.findAll();
    }

    public AnswerSubmission submitAnswer(Long questionId, Long userId, Integer timeTaken, Long parentSubmissionId, MultipartFile file) {
        AnswerQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = fileStorageService.storeFile(file);

        AnswerSubmission submission = new AnswerSubmission();
        submission.setQuestion(question);
        submission.setUser(user);
        submission.setTimeTakenMinutes(timeTaken);
        submission.setPdfPath(fileName);
        submission.setParentSubmissionId(parentSubmissionId);
        
        return submissionRepository.save(submission);
    }

    public List<AnswerSubmission> getMySubmissions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return submissionRepository.findByUserOrderBySubmittedAtDesc(user);
    }

    public AnswerSubmission getSubmission(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public AnswerReview submitReview(Long submissionId, AnswerReview review) {
        AnswerSubmission submission = getSubmission(submissionId);
        review.setSubmission(submission);
        
        AnswerReview savedReview = reviewRepository.save(review);
        
        submission.setStatus(AnswerSubmission.SubmissionStatus.REVIEWED);
        submissionRepository.save(submission);
        
        return savedReview;
    }

    public Optional<AnswerReview> getReviewForSubmission(Long submissionId) {
        AnswerSubmission submission = getSubmission(submissionId);
        return reviewRepository.findBySubmission(submission);
    }

    public java.nio.file.Path getFilePath(String fileName) {
        return fileStorageService.getFilePath(fileName);
    }
}
