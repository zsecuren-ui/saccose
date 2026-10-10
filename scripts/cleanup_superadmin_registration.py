from pathlib import Path
import re

files = [
    Path("src/components/auth/AuthPages.tsx"),
    Path("saccos/src/components/auth/AuthPages.tsx"),
    Path("untitled (16)/src/components/auth/AuthPages.tsx"),
]

for path in files:
    text = path.read_text(encoding="utf-8")

    # Remove the obsolete registration mode switcher and any remaining registration labels.
    text = re.sub(
        r"\s*/\* Sub-mode Switcher \*/.*?\n\s*</div>\n",
        "\n",
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(r"\s*setSaEmail\([^\n]*\);\n", "\n", text)
    text = re.sub(r"\s*registerSuperAdmin,\n", "", text)
    text = re.sub(r"SuperAdmin Login / Register", "SuperAdmin Login", text)
    text = re.sub(r"Ingia au Tengeneza akaunti mpya ya SuperAdmin wa Mfumo", "Ingia kama SuperAdmin wa Mfumo", text)
    text = re.sub(r"Sajili Akaunti \(Register\)", "", text)
    text = re.sub(r"Sajili Akaunti ya SuperAdmin", "", text)

    # Normalize the submit handler to login-only regardless of the partial previous edit.
    text, count = re.subn(
        r"  const handleSuperAdminSubmit = (?:async )?\(e: React\.FormEvent\) => \{.*?\n  \};\n\n  const handleInstitutionAdminSubmit",
        """  const handleSuperAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const res = await loginSuperAdmin(saUsername, saPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => onSuccess?.(), 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleInstitutionAdminSubmit""",
        text,
        count=1,
        flags=re.DOTALL,
    )
    if count != 1:
        raise RuntimeError(f"Unexpected submit-handler structure in {path}")

    path.write_text(text, encoding="utf-8")
