package com.walkalong.backend.controller;

import com.walkalong.backend.entity.*;
import com.walkalong.backend.service.AnswerService;
import com.walkalong.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = "*")
public class AnswerController {

    @Autowired private AnswerService answerService;
    @Autowired private UserRepository userRepository;

    @PostMapping("/questions")
    public AnswerQuestion createQuestion(@RequestBody AnswerQuestion question) {
        return answerService.createQuestion(question);
    }

    @GetMapping("/questions")
    public List<AnswerQuestion> getAllQuestions() {
        return answerService.getAllQuestions();
    }

    @PostMapping("/submit")
    public AnswerSubmission submitAnswer(
            @RequestParam("questionId") Long questionId,
            @RequestParam(value = "parentSubmissionId", required = false) Long parentSubmissionId,
            @RequestParam("timeTaken") Integer timeTaken,
            @RequestParam("file") MultipartFile file) {
        
        // Match existing pattern of getting first user for now
        User user = userRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No user found in system"));
        
        return answerService.submitAnswer(questionId, user.getId(), timeTaken, parentSubmissionId, file);
    }

    @GetMapping("/my-submissions")
    public List<AnswerSubmission> getMySubmissions() {
        User user = userRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No user found in system"));
        return answerService.getMySubmissions(user.getId());
    }

    @GetMapping("/submission/{id}")
    public AnswerSubmission getSubmission(@PathVariable Long id) {
        return answerService.getSubmission(id);
    }

    @PostMapping("/review")
    public AnswerReview submitReview(@RequestParam("submissionId") Long submissionId, @RequestBody AnswerReview review) {
        return answerService.submitReview(submissionId, review);
    }

    @GetMapping("/submission/{id}/review")
    public ResponseEntity<AnswerReview> getReview(@PathVariable Long id) {
        return answerService.getReviewForSubmission(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable String fileName) {
        try {
            java.nio.file.Path filePath = answerService.getFilePath(fileName);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (java.net.MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
