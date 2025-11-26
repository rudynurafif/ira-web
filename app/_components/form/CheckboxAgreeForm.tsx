import React from "react";

function CheckboxAgreeForm({
  value,
  onChange,
}: {
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex gap-3 items-center">
      <input
        type="checkbox"
        name="agreement"
        id="agreement"
        className="w-5 h-5 accent-green-600"
        defaultChecked={value}
        onChange={onChange}
      />
      <label htmlFor="agreement">
        Dengan ini saya setuju dengan{" "}
        <a
          href="/terms-and-condition"
          target="_blank"
          className="font-bold text-dark-primary-2 underline"
        >
          Syarat dan Ketentuan serta Kebijakan Privasi
        </a>{" "}
        yang berlaku
      </label>
    </div>
  );
}

export default CheckboxAgreeForm;
