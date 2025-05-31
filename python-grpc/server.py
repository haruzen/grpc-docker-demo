# What this does:
# Purpose: Implements the actual server and its behavior for each gRPC method.
# Defines AddProduct() and ListProducts() behavior
# Starts a gRPC server on port 50051
import grpc
from concurrent import futures
import product_pb2
import product_pb2_grpc

# 🧠 Simulate a database using an in-memory list
products = []

class ProductService(product_pb2_grpc.ProductServiceServicer):
    def AddProduct(self, request, context):
        # 👇 Convert gRPC message to Python dict and add it
        product = product_pb2.Product(id=request.id, name=request.name, price=request.price)
        products.append(product)
        return product_pb2.ProductResponse(message="Product added by gRPC Server!")

    def ListProducts(self, request, context):
        # 👇 Return all added products
        return product_pb2.ProductList(products=products)
    
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    product_pb2_grpc.add_ProductServiceServicer_to_server(ProductService(), server)
    server.add_insecure_port('[::]:50051')  # Listen on all interfaces
    print("✅ gRPC server running on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()  