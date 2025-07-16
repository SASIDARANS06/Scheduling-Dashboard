/**
 * This file was generated from ReactPlanner.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue, ListWidgetValue, SelectionSingleValue } from "mendix";
import { Big } from "big.js";

export type DefaultViewEnum = "Day" | "Week" | "Month" | "Quarter" | "Year";

export interface ReactPlannerContainerProps {
    [x: string]: any;
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    eventData: ListValue;
    eventIdAttr: ListAttributeValue<string | Big>;
    eventStartAttr: ListAttributeValue<Date>;
    eventEndAttr: ListAttributeValue<Date>;
    eventResourceAttr: ListAttributeValue<string | Big>;
    eventTitleAttr: ListAttributeValue<string>;
    eventColorAttr: ListAttributeValue<string>;
    eventSelection: SelectionSingleValue;
    onEventSelection?: ActionValue;
    onEventMoved?: ActionValue;
    onEventResized?: ActionValue;
    popoverContent: ListWidgetValue;
    resourceData: ListValue;
    resourceIdAttr: ListAttributeValue<string | Big | boolean>;
    resourceNameAttr: ListAttributeValue<string>;
    newEventResourceId: EditableValue<string>;
    newEventStart: EditableValue<Date>;
    newEventEnd: EditableValue<Date>;
    moveable: EditableValue<boolean>;
    newEventAction?: ActionValue;
    dragEventId: EditableValue<Big>;
    dragStartDate: EditableValue<Date>;
    dragEndDate: EditableValue<Date>;
    dragResourceId: EditableValue<string>;
    showWeekends: boolean;
    viewStart: EditableValue<Date>;
    viewEnd: EditableValue<Date>;
    showDay: boolean;
    showWeek: boolean;
    showMonth: boolean;
    showQuarter: boolean;
    showYear: boolean;
    defaultView: DefaultViewEnum;
}

export interface ReactPlannerPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    eventData: {} | { caption: string } | { type: string } | null;
    eventIdAttr: string;
    eventStartAttr: string;
    eventEndAttr: string;
    eventResourceAttr: string;
    eventTitleAttr: string;
    eventColorAttr: string;
    eventSelection: "Single";
    onEventSelection: {} | null;
    onEventMoved: {} | null;
    onEventResized: {} | null;
    popoverContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    resourceData: {} | { caption: string } | { type: string } | null;
    resourceIdAttr: string;
    resourceNameAttr: string;
    newEventResourceId: string;
    newEventStart: string;
    newEventEnd: string;
    moveable: string;
    newEventAction: {} | null;
    dragEventId: EditableValue<Big>;
    dragStartDate: string;
    dragEndDate: string;
    dragResourceId: string;
    showWeekends: boolean;
    viewStart: string;
    viewEnd: string;
    showDay: boolean;
    showWeek: boolean;
    showMonth: boolean;
    showQuarter: boolean;
    showYear: boolean;
    defaultView: DefaultViewEnum;
}
