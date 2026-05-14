namespace AssessmentService.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Text { get; set; }

        public QuestionType Type { get; set; }

        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }

        public string CorrectAnswers { get; set; }

        public ICollection<AssessmentQuestion> AssessmentQuestions { get; set; }
    }
}
