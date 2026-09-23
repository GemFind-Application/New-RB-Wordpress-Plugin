import React, { useEffect, useState } from "react";

import Select2 from "react-select2-wrapper";

const Certificates = (props) => {
    const [selectedCertificates, setSelectedCertificates] = useState(false);

    const handleChange = (event) => {
        setSelectedCertificates(event.target.value);
        props.onChangeOrderType(event.target.value);
    };

    useEffect(() => {}, [selectedCertificates]);

    return (
        <div className="range-slider_diamond">
            <div className="slider">
                <h4 className="f_heading diamond_heading"> CERTIFICATES</h4>
                <div className="diamond-ui-slider diamond-small-slider">
                    <Select2
                        data={props.certificateData.map((item) => ({
                            text: item.certificateName,
                            id: item.certificateName,
                        }))}
                        onChange={handleChange}
                        value={selectedCertificates}
                    />
                </div>
            </div>
        </div>
    );
};

export default Certificates;
