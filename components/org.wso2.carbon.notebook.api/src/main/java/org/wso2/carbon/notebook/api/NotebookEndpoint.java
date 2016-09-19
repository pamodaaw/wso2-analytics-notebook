package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.commons.response.NoteStatus;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
import org.wso2.carbon.notebook.commons.response.dto.Note;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * HTTP Responses for general notebook requests
 */
@Path("/")
public class NotebookEndpoint {
    /**
     * Return the list of notes available in the notebook
     *
     * @return response
     */
    @GET
    @Path("/notes")
    public Response executeSearchQuery(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        List<Note> noteNamesList = new ArrayList<>();
        noteNamesList.add(new Note("Note_1", NoteStatus.FULLY_DEPLOYED, NoteStatus.READY));
        noteNamesList.add(new Note("Note_2", NoteStatus.FULLY_DEPLOYED, NoteStatus.READY));
        noteNamesList.add(new Note("Note_3", NoteStatus.FULLY_DEPLOYED, NoteStatus.READY));

        Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
        response.put("notes", noteNamesList);
        jsonString = new Gson().toJson(response);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
