namespace AssessmentService.DTOs
{
    public class QuestionForCandidateDto
    {
        public int Id { get; set; }

        public string Text { get; set; }

        // ✅ MCQ
        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }

        public int Type { get; set; }

        // ✅ Coding
        public string? StarterCode { get; set; }

        // ✅ NEW: Multiple test cases
        public List<TestCaseDto> TestCases { get; set; }
    }
}
