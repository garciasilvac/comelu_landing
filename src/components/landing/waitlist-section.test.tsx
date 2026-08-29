import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { INITIAL_FORM, type FieldErrors } from "./landing-data";
import { WaitlistSection } from "./waitlist-section";

const EMPTY_FIELD_ERRORS: FieldErrors = {
  nombre: "",
  email: "",
  telefonoPais: "",
  telefonoNumero: "",
  rol: "",
  tamano: "",
  intereses: "",
};

describe("WaitlistSection", () => {
  it("presents a visually distinct success alert after submission", () => {
    render(
      <WaitlistSection
        form={INITIAL_FORM}
        fieldErrors={EMPTY_FIELD_ERRORS}
        formError=""
        turnstileError=""
        submitted
        isSubmitting={false}
        firstInputRef={createRef<HTMLInputElement>()}
        turnstileContainerRef={createRef<HTMLDivElement>()}
        onSubmit={vi.fn()}
        onFieldChange={vi.fn()}
        onFieldBlur={vi.fn()}
        onRoleChange={vi.fn()}
        onSizeChange={vi.fn()}
        onInterestChange={vi.fn()}
        onNeedChange={vi.fn()}
      />,
    );

    const successAlert = screen.getByText("Registro recibido").closest('[role="alert"]');
    expect(successAlert).toBeInTheDocument();
    expect(successAlert).toHaveClass("border-emerald-200", "bg-emerald-50", "shadow-sm");
  });
});
