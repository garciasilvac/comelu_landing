import type { FormEvent, RefObject } from "react";
import { CheckCircleIcon, PaperPlaneTiltIcon, WarningCircleIcon } from "@phosphor-icons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type {
  FieldErrors,
  FormState,
  InlineValidatableField,
  Interest,
  LabSize,
  Role,
} from "./landing-data";
import { INTERESTS } from "./landing-data";
import { SectionIntro } from "./landing-sections";

type WaitlistSectionProps = {
  form: FormState;
  fieldErrors: FieldErrors;
  formError: string;
  turnstileError: string;
  submitted: boolean;
  isSubmitting: boolean;
  firstInputRef: RefObject<HTMLInputElement | null>;
  turnstileContainerRef: RefObject<HTMLDivElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: InlineValidatableField, value: string) => void;
  onFieldBlur: (field: InlineValidatableField) => void;
  onRoleChange: (role: Role) => void;
  onSizeChange: (size: LabSize) => void;
  onInterestChange: (interest: Interest, checked: boolean) => void;
  onNeedChange: (value: string) => void;
};

export function WaitlistSection({
  form,
  fieldErrors,
  formError,
  turnstileError,
  submitted,
  isSubmitting,
  firstInputRef,
  turnstileContainerRef,
  onSubmit,
  onFieldChange,
  onFieldBlur,
  onRoleChange,
  onSizeChange,
  onInterestChange,
  onNeedChange,
}: WaitlistSectionProps) {
  return (
    <section id="lista-espera" className="section-block scroll-mt-24" data-reveal>
      <div className="rounded-2xl bg-sky-50 px-4 py-8 ring-1 ring-sky-100 sm:px-8 sm:py-10">
        <SectionIntro
          title="Únete temprano y ayúdanos a construir el software que el rubro necesita"
          description="Déjanos tus datos para contactarte cuando abramos primeros accesos, entrevistas o instancias de validación del producto."
        />

        <Card className="mx-auto mt-8 max-w-5xl shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Lista de espera de Comelu</CardTitle>
            <p className="text-sm text-muted-foreground">Los campos marcados son obligatorios.</p>
          </CardHeader>
          <CardContent>
            <form className="grid gap-8" onSubmit={onSubmit} noValidate>
              <FieldSet>
                <FieldLegend>Datos principales</FieldLegend>
                <FieldDescription>Información necesaria para sumarte a la lista.</FieldDescription>
                <FieldGroup className="grid gap-5 lg:grid-cols-3">
                  <Field data-invalid={Boolean(fieldErrors.nombre)}>
                    <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                    <Input
                      ref={firstInputRef}
                      id="nombre"
                      name="nombre"
                      required
                      value={form.nombre}
                      onChange={(event) => onFieldChange("nombre", event.target.value)}
                      onBlur={() => onFieldBlur("nombre")}
                      placeholder="Ej: Carlos González"
                      aria-invalid={Boolean(fieldErrors.nombre)}
                      aria-describedby={fieldErrors.nombre ? "nombre-error" : "nombre-help"}
                    />
                    {fieldErrors.nombre ? (
                      <FieldError id="nombre-error">{fieldErrors.nombre}</FieldError>
                    ) : (
                      <FieldDescription id="nombre-help">Escribe tu nombre y apellido.</FieldDescription>
                    )}
                  </Field>

                  <Field data-invalid={Boolean(fieldErrors.email)}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(event) => onFieldChange("email", event.target.value)}
                      onBlur={() => onFieldBlur("email")}
                      placeholder="nombre@empresa.cl"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? "email-error" : "email-help"}
                    />
                    {fieldErrors.email ? (
                      <FieldError id="email-error">{fieldErrors.email}</FieldError>
                    ) : (
                      <FieldDescription id="email-help">Formato esperado: nombre@empresa.cl</FieldDescription>
                    )}
                  </Field>

                  <Field data-invalid={Boolean(fieldErrors.rol)}>
                    <FieldLabel htmlFor="rol">Rol</FieldLabel>
                    <NativeSelect
                      id="rol"
                      name="rol"
                      required
                      className="w-full"
                      value={form.rol}
                      onChange={(event) => onRoleChange(event.target.value as Role)}
                      aria-invalid={Boolean(fieldErrors.rol)}
                    >
                      <NativeSelectOption value="">Selecciona</NativeSelectOption>
                      <NativeSelectOption value="Laboratorio dental">Laboratorio dental</NativeSelectOption>
                      <NativeSelectOption value="Laboratorista">Laboratorista</NativeSelectOption>
                      <NativeSelectOption value="Supervisor">Supervisor</NativeSelectOption>
                      <NativeSelectOption value="Clínica con laboratorio propio">Clínica con laboratorio propio</NativeSelectOption>
                      <NativeSelectOption value="Dentista">Dentista</NativeSelectOption>
                      <NativeSelectOption value="Técnico dental">Técnico dental</NativeSelectOption>
                    </NativeSelect>
                    {fieldErrors.rol ? (
                      <FieldError>{fieldErrors.rol}</FieldError>
                    ) : (
                      <FieldDescription>Selecciona el perfil que mejor te representa.</FieldDescription>
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>

              <Separator />

              <FieldSet>
                <FieldLegend>Cuéntanos más</FieldLegend>
                <FieldDescription>Campos opcionales que nos ayudan a priorizar mejor el producto.</FieldDescription>
                <FieldGroup className="grid items-start gap-5 lg:grid-cols-2">
                  <Field data-invalid={Boolean(fieldErrors.telefonoPais || fieldErrors.telefonoNumero)}>
                    <FieldLabel htmlFor="telefono-pais">Teléfono</FieldLabel>
                    <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                      <NativeSelect
                        id="telefono-pais"
                        name="telefonoPais"
                        className="w-full"
                        value={form.telefonoPais}
                        onChange={(event) => onFieldChange("telefonoPais", event.target.value)}
                        onBlur={() => onFieldBlur("telefonoPais")}
                        aria-invalid={Boolean(fieldErrors.telefonoPais)}
                        aria-label="Código de país"
                      >
                        <NativeSelectOption value="">País</NativeSelectOption>
                        <NativeSelectOption value="+56">Chile (+56)</NativeSelectOption>
                        <NativeSelectOption value="+54">Argentina (+54)</NativeSelectOption>
                        <NativeSelectOption value="+57">Colombia (+57)</NativeSelectOption>
                        <NativeSelectOption value="+51">Perú (+51)</NativeSelectOption>
                        <NativeSelectOption value="+52">México (+52)</NativeSelectOption>
                        <NativeSelectOption value="+1">EE.UU./Canadá (+1)</NativeSelectOption>
                        <NativeSelectOption value="+34">España (+34)</NativeSelectOption>
                      </NativeSelect>
                      <Input
                        id="telefono-numero"
                        name="telefonoNumero"
                        type="tel"
                        value={form.telefonoNumero}
                        onChange={(event) => onFieldChange("telefonoNumero", event.target.value)}
                        onBlur={() => onFieldBlur("telefonoNumero")}
                        placeholder="9 1234 5678"
                        aria-label="Número de teléfono"
                        aria-invalid={Boolean(fieldErrors.telefonoNumero)}
                      />
                    </div>
                    <FieldError>{fieldErrors.telefonoPais || fieldErrors.telefonoNumero}</FieldError>
                    {!fieldErrors.telefonoPais && !fieldErrors.telefonoNumero ? (
                      <FieldDescription>Opcional. Si lo dejas, usa el formato país + número.</FieldDescription>
                    ) : null}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tamano">Tamaño del laboratorio / equipo</FieldLabel>
                    <NativeSelect
                      id="tamano"
                      name="tamano"
                      className="w-full"
                      value={form.tamano}
                      onChange={(event) => onSizeChange(event.target.value as LabSize)}
                    >
                      <NativeSelectOption value="">Selecciona</NativeSelectOption>
                      <NativeSelectOption value="1–3 personas">1–3 personas</NativeSelectOption>
                      <NativeSelectOption value="4–10 personas">4–10 personas</NativeSelectOption>
                      <NativeSelectOption value="11+ personas">11+ personas</NativeSelectOption>
                    </NativeSelect>
                  </Field>

                  <FieldSet className="lg:col-span-2">
                    <FieldLegend>Intereses / funcionalidades</FieldLegend>
                    <FieldDescription>Opcional. Selecciona un máximo de 3.</FieldDescription>
                    <FieldGroup data-slot="checkbox-group" className="grid gap-2 sm:grid-cols-2">
                      {INTERESTS.map((interest, index) => {
                        const checked = form.intereses.includes(interest);
                        const disabled = !checked && form.intereses.length >= 3;
                        const id = `interest-${index}`;
                        return (
                          <Field key={interest} orientation="horizontal" data-disabled={disabled || undefined}>
                            <Checkbox
                              id={id}
                              name="intereses"
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={(nextChecked) => onInterestChange(interest, nextChecked)}
                            />
                            <FieldLabel htmlFor={id}>{interest}</FieldLabel>
                          </Field>
                        );
                      })}
                    </FieldGroup>
                  </FieldSet>

                  <Field className="lg:col-span-2">
                    <FieldLabel htmlFor="otra-necesidad">
                      ¿Hay alguna otra necesidad que te gustaría que Comelu resolviera?
                    </FieldLabel>
                    <Textarea
                      id="otra-necesidad"
                      name="otraNecesidad"
                      rows={5}
                      maxLength={2000}
                      value={form.otraNecesidad}
                      onChange={(event) => onNeedChange(event.target.value)}
                      placeholder="Cuéntanos cualquier necesidad, problema o idea"
                    />
                    <FieldDescription>Opcional. Puedes contarnos cualquier idea o problema adicional.</FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <input type="hidden" name="checklist" value={form.checklist ? "true" : "false"} />

              <Field>
                <FieldLabel>Comprobación de seguridad</FieldLabel>
                <div ref={turnstileContainerRef} />
                {turnstileError ? <FieldError>{turnstileError}</FieldError> : null}
              </Field>

              {formError ? (
                <Alert variant="destructive">
                  <WarningCircleIcon />
                  <AlertTitle>No pudimos enviar el formulario</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              {submitted ? (
                <Alert className="border-primary/30 bg-primary/5 text-primary">
                  <CheckCircleIcon />
                  <AlertTitle>Registro recibido</AlertTitle>
                  <AlertDescription>
                    Te contactaremos cuando haya novedades, primeros accesos o instancias de validación.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? <Spinner data-icon="inline-start" aria-label="Enviando" /> : <PaperPlaneTiltIcon data-icon="inline-start" />}
                  {isSubmitting ? "Enviando..." : "Quiero unirme a la lista de espera"}
                </Button>
                <p className="max-w-lg text-sm text-muted-foreground">
                  Solo te contactaremos por novedades relevantes del producto.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
