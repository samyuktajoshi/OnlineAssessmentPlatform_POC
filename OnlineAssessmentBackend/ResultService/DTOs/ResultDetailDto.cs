namespace ResultService.DTOs
{
    public class ResultDetailDto
    {

        public int QuestionId { get; set; }
        public string QuestionText { get; set; }

        public string? UserAnswer { get; set; }
        public string? CorrectAnswer { get; set; }

        public bool IsCorrect
        {
            get; set;

        }

        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }

    }
}