namespace ResultService.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public string CorrectAnswers { get; set; }
        public string Text { get; set; }

        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }

    }
}
