import {Field } from 'react-final-form'
import React  from 'react'
import NestInputComponent from './nestedInput'


export default function FieldComponent(props){
    return(
        <Field
            name={props.name}
            placeholder={props.placeholderName}
            
        >
                {({ input, meta, placeholder,name}) => {
                return (
                    <NestInputComponent
                        key={name}
                        {...input}
                        {...props}
                        header={placeholder}
                        style={{...props.style,marginBottom:'5%'}}
                        meta={meta}
                        /> 
                )
            }}
                
        </Field>
    )
}