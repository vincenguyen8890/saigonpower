-- Create the deal-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deal-documents',
  'deal-documents',
  true,
  10485760,  -- 10 MB per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload/read/delete files scoped to deals
CREATE POLICY "Authenticated users can upload deal documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'deal-documents');

CREATE POLICY "Authenticated users can read deal documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'deal-documents');

CREATE POLICY "Authenticated users can delete deal documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'deal-documents');
