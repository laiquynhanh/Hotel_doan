// ========================================
// CONTROLLER TẢI LÊN (Upload Controller)
// ========================================
// Xử lý các endpoint liên quan đến:
// - Tải lên hình ảnh phòng (/upload/room-image)
// - Tải lên hình ảnh mục thực đơn (/upload/food-image)
// - Nén hình ảnh, tối ưu kích thước
// - Xác thực loại file (jpg, png)
// - Lưu vào /uploads/images

package com.example.controllers;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.constants.ErrorMessages;
import com.example.dto.UploadResponse;
import com.example.exception.BadRequestException;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadRootDir;

    @Value("${app.upload.max-size:5242880}") // 5MB default
    private long maxFileSize;

    @Value("${app.upload.max-width:1920}")
    private int maxImageWidth;

    @Value("${app.upload.max-height:1080}")
    private int maxImageHeight;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp",
            "image/gif"
    );

    @PostMapping(path = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        // Validation
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(ErrorMessages.FILE_EMPTY);
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException(ErrorMessages.FILE_TOO_LARGE);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BadRequestException(ErrorMessages.INVALID_FILE_TYPE);
        }

        // Sanitize filename to prevent path traversal
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Tên file không hợp lệ");
        }
        originalFilename = StringUtils.cleanPath(originalFilename);

        // Ensure directory exists
        Path imagesDir = Paths.get(uploadRootDir, "images");
        Files.createDirectories(imagesDir);

        // Get extension
        String ext = getExtension(originalFilename, contentType);

        // Process and resize image if needed
        byte[] processedImage = processImage(file, contentType);

        // Save with unique filename
        String filename = UUID.randomUUID().toString() + ext;
        Path target = imagesDir.resolve(filename);
        Files.write(target, processedImage);

        // Build absolute URL
        String fileUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path("/uploads/images/")
                .path(filename)
                .toUriString();

        UploadResponse response = new UploadResponse(filename, fileUrl, contentType, processedImage.length);
        return ResponseEntity.ok(response);
    }

    private String getExtension(String filename, String contentType) {
        int dot = filename.lastIndexOf('.');
        if (dot >= 0 && dot < filename.length() - 1) {
            return filename.substring(dot);
        }
        // Default extension based on content-type
        return switch (contentType) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    private byte[] processImage(MultipartFile file, String contentType) throws IOException {
        // For GIF, skip processing to preserve animation
        if ("image/gif".equals(contentType)) {
            return file.getBytes();
        }

        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
        if (originalImage == null) {
            throw new BadRequestException("Không thể đọc file ảnh");
        }

        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        // Resize if image is too large
        if (width > maxImageWidth || height > maxImageHeight) {
            double ratio = Math.min((double) maxImageWidth / width, (double) maxImageHeight / height);
            int newWidth = (int) (width * ratio);
            int newHeight = (int) (height * ratio);

            BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = resizedImage.createGraphics();
            graphics.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
            graphics.dispose();

            originalImage = resizedImage;
        }

        // Convert to JPEG with compression
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(originalImage, "jpg", baos);
        return baos.toByteArray();
    }
}
