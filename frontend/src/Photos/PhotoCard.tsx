import { Card } from "@blueprintjs/core";
import * as React from "react";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { getPhotoImgPath } from "~redux/api/photos";

export interface IPhotoCardProps {
    photo: IPhotoReqJSON;
}

export const PhotoCard: React.FunctionComponent<IPhotoCardProps> = (props) => {
    return (
        <Card className="photoCard">
            <img src={getPhotoImgPath(props.photo)}></img>
        </Card>
    );
};
