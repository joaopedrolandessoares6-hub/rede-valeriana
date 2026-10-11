const SUPABASE_URL = "https://xabcmkktfwrawmhuwzyl.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_BouziJPMdZcdKdx69cQiow_LaF67tFi";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);/* Estilos exclusivos da Área do Redator */
#area-redator .writer-panel {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border: 1px solid #dbe3ec;
  border-radius: 12px;
  box-sizing: border-box;
}

#area-redator .writer-panel label {
  display: block;
  margin: 16px 0 6px;
  font-weight: 600;
}

#area-redator .writer-panel input,
#area-redator .writer-panel textarea {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
  box-sizing: border-box;
}

#area-redator .writer-panel textarea {
  min-height: 180px;
  resize: vertical;
}

#area-redator .writer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

#area-redator [hidden] {
  display: none !important;
}

#area-redator #writer-message,
#area-redator #article-message {
  overflow-wrap: anywhere;
}

#area-redator #articles-list {
  display: grid;
  gap: 8px;
}

@media (max-width: 600px) {
  #area-redator .writer-panel {
    padding: 16px;
  }

  #area-redator .writer-actions {
    flex-direction: column;
  }
}