namespace ResultService.DTOs
{
    public class UserAnalyticsDto
    {
        public int TotalTests { get; set; }
        public double AverageScore { get; set; }
        public double BestScore { get; set; }

        public List<ResultItemDto> Results { get; set; }
    }

    public class ResultItemDto
    {
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; }

        public int Score { get; set; }
        public double Percentage { get; set; }
        public DateTime Date { get; set; }
    }
}
