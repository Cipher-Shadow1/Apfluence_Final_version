import React from "react";
import { Chrome, FileSpreadsheet } from "lucide-react";

export const ImportSection = () => {
  return (
    <section className="mt-10 px-6 mb-12">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-4">
        Import creators from external sources
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-blue-200 transition-colors shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Chrome className="w-8 h-8 text-[var(--color-platform-chrome)]" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-gray-900">
                Chrome plugin
              </h4>
              <p className="text-[13px] text-gray-500">
                Add creators from social media profile pages
              </p>
            </div>
          </div>
          <button className="bg-[var(--color-bg-dark)] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-black transition-colors whitespace-nowrap">
            Download
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-blue-200 transition-colors shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-8 h-8 text-[var(--color-success)]" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-gray-900">
                Upload CSV file
              </h4>
              <p className="text-[13px] text-gray-500 truncate max-w-[280px]">
                Upload your creator profiles to add them to a list
              </p>
            </div>
          </div>
          <button className="bg-[var(--color-bg-dark)] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-black transition-colors whitespace-nowrap">
            Upload CSV
          </button>
        </div>
      </div>
    </section>
  );
};
