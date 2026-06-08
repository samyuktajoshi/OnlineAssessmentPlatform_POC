using System.Text.Json.Serialization;
namespace AssessmentService.Models
{
    public class TestCase
    {
        public int Id { get; set; }

        public string Input { get; set; }

        public string ExpectedOutput { get; set; }

        public bool IsHidden { get; set; }

        // ✅ relationship
        public int QuestionId { get; set; }

        [JsonIgnore]  // ✅ ✅ ✅ ADD THIS (CRITICAL FIX)
        public Question Question { get; set; }

    }
}
