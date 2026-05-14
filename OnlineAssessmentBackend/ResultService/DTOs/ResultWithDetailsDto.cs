namespace ResultService.DTOs
{
    public class ResultWithDetailsDto
    {
        
            public int Score { get; set; }
            public int TotalQuestions { get; set; }
            public double Percentage { get; set; }

            public List<ResultDetailDto> Details { get; set; }

        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }


    }
}
