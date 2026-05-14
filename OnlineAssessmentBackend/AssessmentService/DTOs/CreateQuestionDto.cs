namespace AssessmentService.DTOs
{
    public class CreateQuestionDto
    {
        public string Text { get; set; }
        public int Type { get; set; }

        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }

        public string CorrectAnswers { get; set; }
    }
}
