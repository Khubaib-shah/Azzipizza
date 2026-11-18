import React from "react";

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div className="space-y-0.5">
        <h1 className="!font-sans text-xl sm:text-2xl font-semibold !text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm !text-slate-500 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 w-full sm:w-auto self-start sm:self-center shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
