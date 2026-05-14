namespace AssessmentService.Models
{
    public class AssessmentQuestion
    {
        public int AssessmentId { get; set; }
        public Assessment Assessment { get; set; }

        public int QuestionId { get; set; }
        public Question Question { get; set; }
    }
}
