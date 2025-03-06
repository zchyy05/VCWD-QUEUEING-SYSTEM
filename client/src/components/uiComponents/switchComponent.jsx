import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const SwitchComponent = ({ checked, onChange }) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label="Please turn on if you are pregnant, a senior citizen, or a person with a disability."
        className="text-sm font-rubik"
      />
    </FormGroup>
  );
};

export default SwitchComponent;
