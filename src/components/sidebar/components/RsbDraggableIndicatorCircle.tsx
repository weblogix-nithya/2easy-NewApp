import { faCheck } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function RsbDraggableIndicatorCircle(props: {
  destinationStatus: number;
  indicatorColor: string;
}) {
  const { destinationStatus, indicatorColor } = props;
  /* 
  TODO: Figure out how to do logic if a pickup job is complete (bg will be blue instead of green)
  pickup = 1 (if completed = blue)
  deliver = 2 (if completed = green)
  complete = 3 completed 
  */
  //  TODO: Might need an indicatorBackgroundColor?
  return (
    <>
      <div
        className="rsb-dot"
        style={{
          borderColor: indicatorColor,
          backgroundColor: destinationStatus == 3 ? "#1D2D53" : "white",
        }}
      >
        {destinationStatus == 3 ? (
          <FontAwesomeIcon icon={faCheck} className="text-white text-xxs" />
        ) : null}
      </div>
    </>
  );
}

export default RsbDraggableIndicatorCircle;
