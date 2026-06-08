namespace AssessmentService.DTOs
{
    public class CreateQuestionDto
    {
        public string Text { get; set; }

        public int Type { get; set; }

        // ✅ MCQ fields (optional now)
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }

        public string? CorrectAnswers { get; set; }

        // ✅ NEW — Coding fields
        public string? StarterCode { get; set; }
        //public string? Input { get; set; }
        //public string? ExpectedOutput { get; set; }
        public List<TestCaseDto> TestCases { get; set; }

    }
}