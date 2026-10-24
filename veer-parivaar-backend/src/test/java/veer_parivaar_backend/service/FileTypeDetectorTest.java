package veer_parivaar_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class FileTypeDetectorTest {

    @Test
    void detectsPdfFromMagicBytes() {
        byte[] pdf = new byte[] {0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34};
        assertEquals(DetectedFileType.PDF, FileTypeDetector.detect(pdf).orElseThrow());
    }

    @Test
    void detectsJpegFromMagicBytes() {
        byte[] jpeg = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        assertEquals(DetectedFileType.JPEG, FileTypeDetector.detect(jpeg).orElseThrow());
    }

    @Test
    void detectsPngFromMagicBytes() {
        byte[] png = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00
        };
        assertEquals(DetectedFileType.PNG, FileTypeDetector.detect(png).orElseThrow());
    }

    @Test
    void rejectsUnknownOrEmptyContent() {
        assertTrue(FileTypeDetector.detect(new byte[] {0x00, 0x01, 0x02}).isEmpty());
        assertTrue(FileTypeDetector.detect(new byte[0]).isEmpty());
        assertTrue(FileTypeDetector.detect(null).isEmpty());
    }

    @Test
    void doesNotTrustAMisleadingNameBecauseDetectionUsesBytesOnly() {
        byte[] executableHeader = new byte[] {0x4D, 0x5A};
        assertTrue(FileTypeDetector.detect(executableHeader).isEmpty());
    }
}
