interface Payment {
    values: String;
  }
  
  const Payment: React.FC<Payment> = (props) => {
    return (
      <>
      <div>
        <h2 className="px-5 text-xl py-4">{props.values}</h2>
  
      </div>
      </>
    );
  };
  
  export default Payment;
  