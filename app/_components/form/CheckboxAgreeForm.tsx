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
        className="w-[20px] h-[20px]"
        defaultChecked={value}
        onChange={onChange}
      />
      <label htmlFor="agreement">
        Dengan ini saya setuju dengan Syarat dan Ketentuan dan Kebijakan Privasi
        yang berlaku
      </label>
    </div>
  );
}

export default CheckboxAgreeForm;
