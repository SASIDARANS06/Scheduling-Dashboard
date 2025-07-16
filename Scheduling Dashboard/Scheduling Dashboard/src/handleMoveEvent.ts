import { ReactPlannerContainerProps } from "./typings/ReactPlannerProps";
import { ObjectItem } from "mendix";

export interface CustomEventItem {
    id: string | number;
    start: string;
    end: string;
    resourceId: string;
    title: string;
    bgColor?: string;
    click: () => void;
    item: ObjectItem;
}

export function handleMoveEvent(
    props: ReactPlannerContainerProps,
    event: CustomEventItem,
    newSlotId: string,
    newStart: string,
    newEnd: string
): void {
    // ✅ Get editable attribute references
    const resourceAttr = props.eventResourceAttr.get(event.item);
    const startAttr = props.eventStartAttr.get(event.item);
    const endAttr = props.eventEndAttr.get(event.item);

    // ✅ Use .setValue() to update
    resourceAttr?.setValue(newSlotId);
    startAttr?.setValue(new Date(newStart));
    endAttr?.setValue(new Date(newEnd));

    // ✅ Select the item & run action
    props.eventSelection.setSelection(event.item);
    props.moveEventAction?.execute();

    // ✅ Refresh events
    props.eventData.reload();
}
