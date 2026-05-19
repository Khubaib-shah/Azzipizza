import { FaStar } from "react-icons/fa";

/**
 * Consistent section header used across all client pages.
 * Decorative lines + star icons + title + subtitle.
 *
 * @param {object} props
 * @param {string} props.title    - The main heading text.
 * @param {string} props.subtitle - The subtitle text below the heading.
 */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-12">
      <div className="decorative-line flex-grow max-w-[100px]"></div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaStar className="text-amber-500 text-3xl" />
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 capitalize">
            {title}
          </h2>
          <FaStar className="text-amber-500 text-3xl" />
        </div>
        <p className="text-sm md:text-xl text-gray-600">{subtitle}</p>
      </div>
      <div className="decorative-line flex-grow max-w-[100px]"></div>
    </div>
  );
}

export default SectionHeader;
