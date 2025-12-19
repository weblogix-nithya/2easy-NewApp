import { faCheck } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function RsbJobIndicatorCircle(props: { destinationStatus: number }) {
  const { destinationStatus } = props;
  /* 
  TODO: Figure out how to do logic if a pickup job is complete (bg will be blue instead of green)
  pickup = 1 (if completed = blue)
  deliver = 2 (if completed = green)
  complete = 3 completed 
  */

  return (
    <>
      <div className="rsb-job-instruction-circle mr-2">
        {destinationStatus == 3 ? (
          <div className="job-indicator-circle mr-2 rounded-full border-2  !bg-[var(--chakra-colors-green-500)] border-[#2BA620]">
            <FontAwesomeIcon icon={faCheck} className="text-white text-xxs" />
          </div>
        ) : (
          <div className="job-indicator-circle mr-2 rounded-full border-2 !bg-white"></div>
        )}
        {/* Need this element to grow the decorative connecting rod */}
        <div className="job-instruction-circle-rod"></div>
      </div>
    </>
  );
}

export default RsbJobIndicatorCircle;
