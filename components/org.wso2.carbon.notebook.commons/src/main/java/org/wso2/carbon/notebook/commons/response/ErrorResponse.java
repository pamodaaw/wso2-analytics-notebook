package org.wso2.carbon.notebook.commons.response;

public class ErrorResponse extends GeneralResponse {
    private String message;

    public ErrorResponse(String message) {
        super(Status.ERROR);
        this.message = message;
    }

    public ErrorResponse(String status, String message) {
        super(status);
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}