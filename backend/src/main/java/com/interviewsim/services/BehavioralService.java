package com.interviewsim.services;

import com.interviewsim.dto.BehavioralResultResponse;
import com.interviewsim.dto.BehavioralSubmitRequest;
import com.interviewsim.models.BehavioralResult;
import com.interviewsim.repositories.BehavioralResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BehavioralService {

    private final BehavioralResultRepository behavioralResultRepository;

    private static final String[] TIPS = {
            "Lead with a clear, concise introduction. Mention your field, year, and a key achievement.",
            "Use STAR method. The 'Action' part should take 60% of your answer time.",
            "Be specific about your 5-year goal. Research the company's growth trajectory first.",
            "Show empathy and resolution. Emphasize what you learned from the conflict.",
            "Match your strengths to the job description. Be genuine about improvement areas.",
            "Quantify your impact. 'I improved system performance by 40%' beats 'I worked hard'."
    };

    public BehavioralResultResponse evaluate(String userId, BehavioralSubmitRequest request) {
        List<BehavioralResult.QuestionScore> scores = new ArrayList<>();
        List<BehavioralResultResponse.QuestionFeedback> feedbacks = new ArrayList<>();

        List<BehavioralSubmitRequest.QuestionResponse> responses = request.getResponses() == null
                ? new ArrayList<>()
                : request.getResponses();

        for (BehavioralSubmitRequest.QuestionResponse qr : responses) {
            if (!qr.isAnswered()) continue;

            double baseScore = 65 + Math.random() * 30;
            double confidence = calculateConfidenceScore(qr.getDurationSeconds());
            double clarity = 60 + Math.random() * 35;
            double overall = (baseScore * 0.4 + confidence * 0.3 + clarity * 0.3);

            overall = Math.round(overall * 10.0) / 10.0;
            confidence = Math.round(confidence * 10.0) / 10.0;
            clarity = Math.round(clarity * 10.0) / 10.0;

            BehavioralResult.QuestionScore qs = new BehavioralResult.QuestionScore(
                    qr.getQuestionIndex(), overall, confidence, clarity, qr.getDurationSeconds()
            );
            scores.add(qs);

            feedbacks.add(new BehavioralResultResponse.QuestionFeedback(
                    qr.getQuestionIndex(), overall, confidence, clarity,
                    TIPS[qr.getQuestionIndex() % TIPS.length]
            ));
        }

        double avgOverall = scores.stream().mapToDouble(BehavioralResult.QuestionScore::getOverallScore).average().orElse(0);
        double avgConf = scores.stream().mapToDouble(BehavioralResult.QuestionScore::getConfidenceScore).average().orElse(0);
        double avgClarity = scores.stream().mapToDouble(BehavioralResult.QuestionScore::getClarityScore).average().orElse(0);

        BehavioralResult result = BehavioralResult.builder()
                .questionScores(scores)
                .avgConfidence(avgConf)
                .avgClarity(avgClarity)
                .avgOverall(avgOverall)
                .questionsAnswered(scores.size())
                .totalQuestions(6)
                .build();
        result.setUserId(userId);
        result.evaluate();
        behavioralResultRepository.save(result);

        return BehavioralResultResponse.builder()
                .avgOverall(Math.round(avgOverall * 10.0) / 10.0)
                .avgConfidence(Math.round(avgConf * 10.0) / 10.0)
                .avgClarity(Math.round(avgClarity * 10.0) / 10.0)
                .questionsAnswered(scores.size())
                .totalQuestions(6)
                .percentage(Math.round(avgOverall * 10.0) / 10.0)
                .grade(result.getGrade())
                .perQuestionFeedback(feedbacks)
                .recommendations(buildBehavioralRecommendations(avgOverall, avgConf, avgClarity))
                .build();
    }

    private double calculateConfidenceScore(long durationSecs) {
        if (durationSecs >= 60 && durationSecs <= 90) return 85 + Math.random() * 15;
        if (durationSecs >= 30 && durationSecs < 60) return 65 + Math.random() * 20;
        if (durationSecs > 90 && durationSecs <= 120) return 70 + Math.random() * 20;
        return 50 + Math.random() * 20;
    }

    private List<String> buildBehavioralRecommendations(double overall, double conf, double clarity) {
        List<String> recs = new ArrayList<>();
        if (conf < 70) recs.add("Work on confidence: practice answers daily for 2 weeks. Aim for 60-90 second responses.");
        if (clarity < 70) recs.add("Improve clarity: use STAR method strictly. Write out answers first, then practice speaking.");
        if (overall >= 80) recs.add("Excellent performance! Focus on company-specific questions now.");
        if (recs.isEmpty()) recs.add("Good foundation. Record yourself answering and review playback for improvement.");
        return recs;
    }
}
