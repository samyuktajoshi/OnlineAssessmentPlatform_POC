using AssessmentService.DTOs;
using AssessmentService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AssessmentService.Controllers
{
    [ApiController]
    [Route("api/assessments")]
    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentService _service;

        public AssessmentController(IAssessmentService service)
        {
            _service = service;
        }


        // ✅ CREATE (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateAssessmentDto dto)
        {
            var id = await _service.CreateAsync(dto, User);
            return Ok(new { assessmentId = id }); // ✅
        }

        // ✅ GET ALL (Candidate + Admin)
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        // ✅ GET MY ASSESSMENTS (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMy()
        {
            return Ok(await _service.GetMyAssessmentsAsync(User));
        }

        // ✅ UPDATE (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateAssessmentDto dto)
        {
            return Ok(await _service.UpdateAsync(id, dto, User));
        }

        // ✅ DELETE (Admin only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok(await _service.DeleteAsync(id, User));
        }

        //// ✅ GET BY ID (optional, useful)
        //[Authorize]
        //[HttpGet("{id}")]
        //public async Task<IActionResult> GetById(int id)
        //{
        //    var assessment = await _service.GetByIdAsync(id);

        //    if (assessment == null)
        //        return NotFound(new { message = "Assessment not found" });

        //    return Ok(assessment);
        //}
        //[HttpGet("{id}")]
        //public async Task<IActionResult> GetById(int id)
        //{
        //    try
        //    {
        //        var assessment = await _service.GetByIdAsync(id);

        //        if (assessment == null)
        //            return NotFound("Not found");

        //        return Ok(assessment);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ex.Message);
        //    }
        //}
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var assessment = await _service.GetByIdAsync(id);
            return Ok(assessment);
        }
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
    [FromRoute] int id,
    [FromBody] UpdateStatusDto dto
)
        {
            await _service.UpdateStatusAsync(id, dto.Status, User);
            return Ok("Status updated");
        }
    }
    }