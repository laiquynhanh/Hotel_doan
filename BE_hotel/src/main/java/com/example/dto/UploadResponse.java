package com.example.dto;

public class UploadResponse {
    private String filename;
    private String url;
    private String contentType;
    private long size;

    public UploadResponse() {}

    public UploadResponse(String filename, String url, String contentType, long size) {
        this.filename = filename;
        this.url = url;
        this.contentType = contentType;
        this.size = size;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }
}
