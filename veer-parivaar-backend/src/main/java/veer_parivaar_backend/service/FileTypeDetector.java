package veer_parivaar_backend.service;

import java.util.Optional;

public final class FileTypeDetector {

    private static final byte[] JPEG_SIGNATURE = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_SIGNATURE = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };
    private static final byte[] PDF_SIGNATURE = new byte[] {0x25, 0x50, 0x44, 0x46};

    private FileTypeDetector() {
    }

    public static Optional<DetectedFileType> detect(byte[] content) {
        if (content == null || content.length == 0) {
            return Optional.empty();
        }
        if (startsWith(content, JPEG_SIGNATURE)) {
            return Optional.of(DetectedFileType.JPEG);
        }
        if (startsWith(content, PNG_SIGNATURE)) {
            return Optional.of(DetectedFileType.PNG);
        }
        if (startsWith(content, PDF_SIGNATURE)) {
            return Optional.of(DetectedFileType.PDF);
        }
        return Optional.empty();
    }

    private static boolean startsWith(byte[] content, byte[] signature) {
        if (content.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if (content[i] != signature[i]) {
                return false;
            }
        }
        return true;
    }
}
